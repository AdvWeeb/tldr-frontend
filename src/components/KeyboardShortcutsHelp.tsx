import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Keyboard } from 'lucide-react';

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-white hover:bg-gray-100"
        onClick={() => setIsOpen(true)}
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>
                Navigate faster with keyboard shortcuts
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Navigation</h3>
              <div className="space-y-2">
                <ShortcutRow keys={['j', '↓']} description="Next email" />
                <ShortcutRow keys={['k', '↑']} description="Previous email" />
                <ShortcutRow keys={['Enter']} description="Open selected email" />
                <ShortcutRow keys={['Esc']} description="Close email detail" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Actions</h3>
              <div className="space-y-2">
                <ShortcutRow keys={['s']} description="Star/unstar email" />
                <ShortcutRow keys={['e']} description="Archive email" />
                <ShortcutRow keys={['#', 'Delete']} description="Delete email" />
                <ShortcutRow keys={['c']} description="Compose new email" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Other</h3>
              <div className="space-y-2">
                <ShortcutRow keys={['/']} description="Focus search" />
                <ShortcutRow keys={['r']} description="Refresh email list" />
                <ShortcutRow keys={['?']} description="Show keyboard shortcuts" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
      <span className="text-sm text-gray-700">{description}</span>
      <div className="flex gap-2">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded shadow-sm"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
