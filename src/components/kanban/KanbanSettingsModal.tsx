import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useKanbanColumns, useKanbanMutations } from '@/hooks/useEmail';
import { toast } from 'sonner';

interface KanbanSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KanbanSettingsModal({ isOpen, onClose }: KanbanSettingsModalProps) {
  const { data: columns = [], isLoading } = useKanbanColumns();
  const { createColumn, updateColumn, deleteColumn, initializeColumns } = useKanbanMutations();
  
  const [localColumns, setLocalColumns] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newColumn, setNewColumn] = useState({ title: '', gmailLabelId: '', color: '#3B82F6' });

  useEffect(() => {
    if (columns.length > 0) {
      setLocalColumns([...columns].sort((a, b) => a.orderIndex - b.orderIndex));
    }
  }, [columns]);

  if (!isOpen) return null;

  const handleAddColumn = () => {
    if (!newColumn.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    createColumn.mutate({
      title: newColumn.title,
      gmailLabelId: newColumn.gmailLabelId || null,
      color: newColumn.color,
    }, {
      onSuccess: () => {
        setIsAdding(false);
        setNewColumn({ title: '', gmailLabelId: '', color: '#3B82F6' });
        toast.success('Column added');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to add column');
      }
    });
  };

  const handleUpdateColumn = (id: number, data: any) => {
    updateColumn.mutate({ id, data }, {
      onSuccess: () => {
        toast.success('Column updated');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to update column');
      }
    });
  };

  const handleDeleteColumn = (id: number) => {
    if (window.confirm('Are you sure you want to delete this column?')) {
      deleteColumn.mutate(id, {
        onSuccess: () => {
          toast.success('Column deleted');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to delete column');
        }
      });
    }
  };

  const handleInitialize = () => {
    initializeColumns.mutate(undefined, {
      onSuccess: () => {
        toast.success('Board initialized with default columns');
      }
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Kanban Board Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {columns.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No columns configured for your board.</p>
              <Button onClick={handleInitialize}>Initialize Default Columns</Button>
            </div>
          )}

          <div className="space-y-4">
            {localColumns.map((col) => (
              <div key={col.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                  <div>
                    <Label className="text-[10px] uppercase text-gray-500">Title</Label>
                    <Input 
                      value={col.title} 
                      onChange={(e) => {
                        const newCols = localColumns.map(c => c.id === col.id ? { ...c, title: e.target.value } : c);
                        setLocalColumns(newCols);
                      }}
                      onBlur={() => col.title !== columns.find((c: any) => c.id === col.id)?.title && handleUpdateColumn(col.id, { title: col.title })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-gray-500">Gmail Label ID</Label>
                    <Input 
                      value={col.gmailLabelId || ''} 
                      placeholder="e.g. STARRED, INBOX"
                      onChange={(e) => {
                        const newCols = localColumns.map(c => c.id === col.id ? { ...c, gmailLabelId: e.target.value } : c);
                        setLocalColumns(newCols);
                      }}
                      onBlur={() => col.gmailLabelId !== columns.find((c: any) => c.id === col.id)?.gmailLabelId && handleUpdateColumn(col.id, { gmailLabelId: col.gmailLabelId || null })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-[10px] uppercase text-gray-500">Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={col.color} 
                          onChange={(e) => {
                            const newCols = localColumns.map(c => c.id === col.id ? { ...c, color: e.target.value } : c);
                            setLocalColumns(newCols);
                          }}
                          onBlur={() => col.color !== columns.find((c: any) => c.id === col.id)?.color && handleUpdateColumn(col.id, { color: col.color })}
                          className="h-8 w-12 p-0 border-0 bg-transparent"
                        />
                        <Input 
                          value={col.color} 
                          onChange={(e) => {
                            const newCols = localColumns.map(c => c.id === col.id ? { ...c, color: e.target.value } : c);
                            setLocalColumns(newCols);
                          }}
                          onBlur={() => col.color !== columns.find((c: any) => c.id === col.id)?.color && handleUpdateColumn(col.id, { color: col.color })}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteColumn(col.id)}
                        disabled={col.isDefault}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isAdding ? (
            <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
              <h3 className="text-sm font-medium">Add New Column</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-title">Title</Label>
                  <Input 
                    id="new-title" 
                    value={newColumn.title} 
                    onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
                    placeholder="e.g. Archive"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-label">Gmail Label Mapping</Label>
                  <Input 
                    id="new-label" 
                    value={newColumn.gmailLabelId} 
                    onChange={(e) => setNewColumn({ ...newColumn, gmailLabelId: e.target.value })}
                    placeholder="e.g. ARCHIVE"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-color">Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="new-color" 
                      type="color" 
                      value={newColumn.color} 
                      onChange={(e) => setNewColumn({ ...newColumn, color: e.target.value })}
                      className="h-10 w-12 p-0 border-0 bg-transparent"
                    />
                    <Input 
                      value={newColumn.color} 
                      onChange={(e) => setNewColumn({ ...newColumn, color: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button onClick={handleAddColumn}>Create Column</Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full border-dashed py-6" 
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add New Column
            </Button>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}


