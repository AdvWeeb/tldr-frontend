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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-[2rem] border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#FFF8F0] px-6 py-5 border-b-2 border-[#0A0A0A] flex justify-between items-center">
          <h2 className="text-2xl font-bold italic text-[#0A0A0A]" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Kanban Board Settings
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="h-9 w-9 rounded-full hover:bg-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {columns.length === 0 && !isLoading && (
            <div className="text-center py-12 px-6">
              <p className="text-[#0A0A0A]/60 mb-6 text-lg">No columns configured for your board.</p>
              <Button 
                onClick={handleInitialize}
                className="bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-6 py-3 font-semibold shadow-[3px_3px_0px_0px_rgba(10,10,10,1)] hover:shadow-[5px_5px_0px_0px_rgba(10,10,10,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
              >
                Initialize Default Columns
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {localColumns.map((col) => (
              <div key={col.id} className="flex items-center gap-3 p-4 border-2 border-[#0A0A0A] rounded-xl bg-[#FFF8F0] hover:shadow-[3px_3px_0px_0px_rgba(10,10,10,0.1)] transition-shadow">
                <GripVertical className="h-5 w-5 text-[#0A0A0A]/40 cursor-grab hover:text-[#0A0A0A]" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                  <div>
                    <Label className="text-xs font-semibold text-[#0A0A0A]/60 uppercase tracking-wide">Title</Label>
                    <Input 
                      value={col.title} 
                      onChange={(e) => {
                        const newCols = localColumns.map(c => c.id === col.id ? { ...c, title: e.target.value } : c);
                        setLocalColumns(newCols);
                      }}
                      onBlur={() => col.title !== columns.find((c: any) => c.id === col.id)?.title && handleUpdateColumn(col.id, { title: col.title })}
                      className="h-9 text-sm border-2 border-[#0A0A0A]/20 rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-[#0A0A0A]/60 uppercase tracking-wide">Gmail Label ID</Label>
                    <Input 
                      value={col.gmailLabelId || ''} 
                      placeholder="e.g. STARRED, INBOX"
                      onChange={(e) => {
                        const newCols = localColumns.map(c => c.id === col.id ? { ...c, gmailLabelId: e.target.value } : c);
                        setLocalColumns(newCols);
                      }}
                      onBlur={() => col.gmailLabelId !== columns.find((c: any) => c.id === col.id)?.gmailLabelId && handleUpdateColumn(col.id, { gmailLabelId: col.gmailLabelId || null })}
                      className="h-9 text-sm border-2 border-[#0A0A0A]/20 rounded-lg mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-xs font-semibold text-[#0A0A0A]/60 uppercase tracking-wide">Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="color" 
                          value={col.color} 
                          onChange={(e) => {
                            const newCols = localColumns.map(c => c.id === col.id ? { ...c, color: e.target.value } : c);
                            setLocalColumns(newCols);
                          }}
                          onBlur={() => col.color !== columns.find((c: any) => c.id === col.id)?.color && handleUpdateColumn(col.id, { color: col.color })}
                          className="h-9 w-12 p-0 border-2 border-[#0A0A0A] rounded-lg"
                        />
                        <Input 
                          value={col.color} 
                          onChange={(e) => {
                            const newCols = localColumns.map(c => c.id === col.id ? { ...c, color: e.target.value } : c);
                            setLocalColumns(newCols);
                          }}
                          onBlur={() => col.color !== columns.find((c: any) => c.id === col.id)?.color && handleUpdateColumn(col.id, { color: col.color })}
                          className="h-9 text-xs font-mono border-2 border-[#0A0A0A]/20 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteColumn(col.id)}
                        disabled={col.isDefault}
                        className="h-9 w-9 text-[#FF6B6B] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-full"
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
            <div className="p-5 border-2 border-dashed border-[#0A0A0A]/30 rounded-xl bg-[#FFF8F0] space-y-4">
              <h3 className="text-base font-bold text-[#0A0A0A]">Add New Column</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-title" className="text-sm font-semibold">Title</Label>
                  <Input 
                    id="new-title" 
                    value={newColumn.title} 
                    onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
                    placeholder="e.g. Archive"
                    className="border-2 border-[#0A0A0A]/20 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-label" className="text-sm font-semibold">Gmail Label Mapping</Label>
                  <Input 
                    id="new-label" 
                    value={newColumn.gmailLabelId} 
                    onChange={(e) => setNewColumn({ ...newColumn, gmailLabelId: e.target.value })}
                    placeholder="e.g. ARCHIVE"
                    className="border-2 border-[#0A0A0A]/20 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-color" className="text-sm font-semibold">Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="new-color" 
                      type="color" 
                      value={newColumn.color} 
                      onChange={(e) => setNewColumn({ ...newColumn, color: e.target.value })}
                      className="h-10 w-12 p-0 border-2 border-[#0A0A0A] rounded-lg"
                    />
                    <Input 
                      value={newColumn.color} 
                      onChange={(e) => setNewColumn({ ...newColumn, color: e.target.value })}
                      className="flex-1 font-mono border-2 border-[#0A0A0A]/20 rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsAdding(false)}
                  className="rounded-full px-5 hover:bg-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddColumn}
                  className="bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-5 font-semibold shadow-[3px_3px_0px_0px_rgba(10,10,10,1)] hover:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:scale-[1.02] transition-all duration-200"
                >
                  Create Column
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              className="w-full border-2 border-dashed border-[#0A0A0A]/30 rounded-xl py-7 bg-white hover:bg-[#FFF8F0] text-[#0A0A0A] font-semibold transition-colors" 
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-5 w-5 mr-2" /> Add New Column
            </Button>
          )}
        </div>

        <div className="bg-[#FFF8F0] px-6 py-5 border-t-2 border-[#0A0A0A] flex justify-end">
          <Button 
            onClick={onClose}
            className="bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] rounded-full px-8 py-2 font-semibold shadow-[3px_3px_0px_0px_rgba(16,249,160,1)] hover:shadow-[5px_5px_0px_0px_rgba(16,249,160,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}


