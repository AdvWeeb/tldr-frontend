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
      setFilters(newFilters);
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
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-background">
      {/* Left Side - Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter Dropdown */}
        <DropdownMenu open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Read Status */}
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium mb-2">Read Status</p>
              <div className="flex gap-2">
                <Button
                  variant={filters.isRead === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleToggleFilter('isRead', false)}
                  className="flex-1"
                >
                  Unread
                </Button>
                <Button
                  variant={filters.isRead === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleToggleFilter('isRead', true)}
                  className="flex-1"
                >
                  Read
                </Button>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Other Filters */}
            <DropdownMenuCheckboxItem
              checked={filters.isStarred === true}
              onCheckedChange={(checked) => handleToggleFilter('isStarred', checked || undefined)}
            >
              ⭐ Starred
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={filters.hasAttachments === true}
              onCheckedChange={(checked) => handleToggleFilter('hasAttachments', checked || undefined)}
            >
              📎 Has Attachments
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={filters.isSnoozed === true}
              onCheckedChange={(checked) => handleToggleFilter('isSnoozed', checked || undefined)}
            >
              ⏰ Snoozed
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            {/* Category Filter */}
            <DropdownMenuLabel>Category</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.category === 'primary'}
              onCheckedChange={() => handleCategoryFilter('primary')}
            >
              Primary
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.category === 'social'}
              onCheckedChange={() => handleCategoryFilter('social')}
            >
              Social
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.category === 'promotions'}
              onCheckedChange={() => handleCategoryFilter('promotions')}
            >
              Promotions
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.category === 'updates'}
              onCheckedChange={() => handleCategoryFilter('updates')}
            >
              Updates
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            {/* Task Status Filter */}
            <DropdownMenuLabel>Task Status</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.taskStatus === 'todo'}
              onCheckedChange={() => handleTaskStatusFilter('todo')}
            >
              To-do
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.taskStatus === 'in_progress'}
              onCheckedChange={() => handleTaskStatusFilter('in_progress')}
            >
              In Progress
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.taskStatus === 'done'}
              onCheckedChange={() => handleTaskStatusFilter('done')}
            >
              Done
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <>
            {filters.isRead !== undefined && (
              <Badge variant="secondary">
                {filters.isRead ? 'Read' : 'Unread'}
              </Badge>
            )}
            {filters.isStarred && <Badge variant="secondary">⭐ Starred</Badge>}
            {filters.hasAttachments && <Badge variant="secondary">📎 Attachments</Badge>}
            {filters.isSnoozed && <Badge variant="secondary">⏰ Snoozed</Badge>}
            {filters.category && (
              <Badge variant="secondary" className="capitalize">
                {filters.category}
              </Badge>
            )}
            {filters.taskStatus && (
              <Badge variant="secondary" className="capitalize">
                {filters.taskStatus.replace('_', ' ')}
              </Badge>
            )}

            {/* Clear All Filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-muted-foreground"
            >
              <X className="h-3 w-3" />
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
            <Button variant="outline" size="sm" className="gap-2">
              {sortOrder === 'ASC' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
              {getSortLabel()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSorting(option.value, sortOrder)}
                className={sortBy === option.value ? 'bg-accent' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Order</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setSorting(sortBy, 'ASC')}
              className={sortOrder === 'ASC' ? 'bg-accent' : ''}
            >
              <SortAsc className="h-4 w-4 mr-2" />
              Ascending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSorting(sortBy, 'DESC')}
              className={sortOrder === 'DESC' ? 'bg-accent' : ''}
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
