import { Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useUIStore, type SortBy } from '@/store/uiStore';
import { useState } from 'react';

export function FilteringSortingToolbar() {
  const {
    sortBy,
    sortOrder,
    setSorting,
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
  } = useUIStore();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'receivedAt', label: 'Date Received' },
    { value: 'subject', label: 'Subject' },
    { value: 'fromEmail', label: 'Sender' },
  ];

  const getSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === sortBy);
    return option ? option.label : 'Sort By';
  };

  const handleToggleFilter = (key: keyof typeof filters, value: any) => {
    if (filters[key] === value) {
      // Remove filter if clicking the same value
      const newFilters = { ...filters };
      delete newFilters[key];
      updateFilters(newFilters);
    } else {
      setFilters({ [key]: value });
    }
  };

  const handleCategoryFilter = (category: string) => {
    handleToggleFilter('category', category as any);
  };

  const handleTaskStatusFilter = (status: string) => {
    handleToggleFilter('taskStatus', status as any);
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 border-b-2 border-[#0A0A0A]/10 bg-white">
      {/* Left Side - Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter Dropdown */}
        <DropdownMenu open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              className="gap-2 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-4 py-2 font-semibold hover:bg-[#FFF8F0] transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] font-bold hover:bg-[#10F9A0]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 border-2 border-[#0A0A0A] rounded-2xl shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] bg-white">
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-[#0A0A0A]/60">Filter Options</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#0A0A0A]/10" />

            {/* Read Status */}
            <div className="px-2 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2.5 text-[#0A0A0A]/60">Read Status</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleToggleFilter('isRead', false)}
                  className={cn(
                    "flex-1 rounded-full font-semibold transition-all duration-200",
                    filters.isRead === false
                      ? "bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] hover:bg-[#10F9A0]"
                      : "bg-white text-[#0A0A0A] border-2 border-[#0A0A0A]/20 hover:border-[#0A0A0A]/40 hover:bg-[#FFF8F0]"
                  )}
                >
                  Unread
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleToggleFilter('isRead', true)}
                  className={cn(
                    "flex-1 rounded-full font-semibold transition-all duration-200",
                    filters.isRead === true
                      ? "bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] hover:bg-[#10F9A0]"
                      : "bg-white text-[#0A0A0A] border-2 border-[#0A0A0A]/20 hover:border-[#0A0A0A]/40 hover:bg-[#FFF8F0]"
                  )}
                >
                  Read
                </Button>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-[#0A0A0A]/10" />

            {/* Other Filters */}
            <DropdownMenuCheckboxItem
              checked={filters.isStarred === true}
              onCheckedChange={(checked) => handleToggleFilter('isStarred', checked || undefined)}
              className="font-medium"
            >
              ⭐ Starred
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={filters.hasAttachments === true}
              onCheckedChange={(checked) => handleToggleFilter('hasAttachments', checked || undefined)}
              className="font-medium"
            >
              📎 Has Attachments
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={filters.isSnoozed === true}
              onCheckedChange={(checked) => handleToggleFilter('isSnoozed', checked || undefined)}
              className="font-medium"
            >
              ⏰ Snoozed
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator className="bg-[#0A0A0A]/10" />

            {/* Category Filter */}
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-[#0A0A0A]/60">Category</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.category === 'primary'}
              onCheckedChange={() => handleCategoryFilter('primary')}
              className="font-medium"
            >
              Primary
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.category === 'social'}
              onCheckedChange={() => handleCategoryFilter('social')}
              className="font-medium"
            >
              Social
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.category === 'promotions'}
              onCheckedChange={() => handleCategoryFilter('promotions')}
              className="font-medium"
            >
              Promotions
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.category === 'updates'}
              onCheckedChange={() => handleCategoryFilter('updates')}
              className="font-medium"
            >
              Updates
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator className="bg-[#0A0A0A]/10" />

            {/* Task Status Filter */}
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-[#0A0A0A]/60">Task Status</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.taskStatus === 'todo'}
              onCheckedChange={() => handleTaskStatusFilter('todo')}
              className="font-medium"
            >
              To-do
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.taskStatus === 'in_progress'}
              onCheckedChange={() => handleTaskStatusFilter('in_progress')}
              className="font-medium"
            >
              In Progress
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.taskStatus === 'done'}
              onCheckedChange={() => handleTaskStatusFilter('done')}
              className="font-medium"
            >
              Done
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <>
            {filters.isRead !== undefined && (
              <Badge className="bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] font-semibold hover:bg-[#10F9A0]">
                {filters.isRead ? 'Read' : 'Unread'}
              </Badge>
            )}
            {filters.isStarred && (
              <Badge className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] font-semibold hover:bg-white">
                ⭐ Starred
              </Badge>
            )}
            {filters.hasAttachments && (
              <Badge className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] font-semibold hover:bg-white">
                📎 Attachments
              </Badge>
            )}
            {filters.isSnoozed && (
              <Badge className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] font-semibold hover:bg-white">
                ⏰ Snoozed
              </Badge>
            )}
            {filters.category && (
              <Badge className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] font-semibold capitalize hover:bg-white">
                {filters.category}
              </Badge>
            )}
            {filters.taskStatus && (
              <Badge className="bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] font-semibold capitalize hover:bg-[#0A0A0A]">
                {filters.taskStatus.replace('_', ' ')}
              </Badge>
            )}

            {/* Clear All Filters */}
            <Button
              size="sm"
              onClick={clearFilters}
              className="gap-1.5 bg-white text-[#FF6B6B] border-2 border-[#FF6B6B] rounded-full px-3 py-1 font-semibold hover:bg-[#FF6B6B]/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </Button>
          </>
        )}
      </div>

      {/* Right Side - Sort Controls */}
      <div className="flex items-center gap-2">
        {/* Sort By Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              className="gap-2 bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-4 py-2 font-semibold hover:bg-[#FFF8F0] transition-colors"
            >
              {sortOrder === 'ASC' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
              {getSortLabel()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-2 border-[#0A0A0A] rounded-2xl shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] bg-white">
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-[#0A0A0A]/60">Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#0A0A0A]/10" />
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSorting(option.value, sortOrder)}
                className={cn(
                  "font-medium",
                  sortBy === option.value && 'bg-[#10F9A0]/10 font-semibold'
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-[#0A0A0A]/10" />
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-[#0A0A0A]/60">Order</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setSorting(sortBy, 'ASC')}
              className={cn(
                "font-medium",
                sortOrder === 'ASC' && 'bg-[#10F9A0]/10 font-semibold'
              )}
            >
              <SortAsc className="h-4 w-4 mr-2" />
              Ascending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSorting(sortBy, 'DESC')}
              className={cn(
                "font-medium",
                sortOrder === 'DESC' && 'bg-[#10F9A0]/10 font-semibold'
              )}
            >
              <SortDesc className="h-4 w-4 mr-2" />
              Descending
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
