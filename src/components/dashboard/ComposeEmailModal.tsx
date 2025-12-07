import { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Image, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEmailMutations } from '@/hooks/useEmail';

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'compose' | 'reply' | 'replyAll' | 'forward';
  mailboxId?: number;
  originalEmail?: {
    subject?: string;
    fromEmail?: string;
    fromName?: string;
    toEmails?: string[];
    ccEmails?: string[];
    bodyHtml?: string;
    bodyText?: string;
    gmailMessageId?: string;
    gmailThreadId?: string;
  };
}

export function ComposeEmailModal({ 
  isOpen, 
  onClose, 
  mode = 'compose',
  mailboxId,
  originalEmail 
}: ComposeEmailModalProps) {
  const { sendEmail } = useEmailMutations();
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when modal opens or props change
  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setTo('');
      setCc('');
      setSubject('');
      setBody('');
      setShowCc(false);
      setErrors({});
      return;
    }

    // Initialize form based on mode
    if (mode === 'reply' || mode === 'replyAll') {
      setTo(originalEmail?.fromEmail || '');
      setCc(mode === 'replyAll' && originalEmail?.ccEmails 
        ? originalEmail.ccEmails.join(', ') 
        : '');
      setSubject(`Re: ${originalEmail?.subject || ''}`);
      const originalBody = originalEmail?.bodyText || originalEmail?.bodyHtml || '';
      const fromLine = `\n\n---\nOn ${new Date().toLocaleString()}, ${originalEmail?.fromName || originalEmail?.fromEmail || 'someone'} <${originalEmail?.fromEmail || ''}> wrote:\n\n`;
      setBody(fromLine + originalBody);
      setShowCc(mode === 'replyAll');
    } else if (mode === 'forward') {
      setTo('');
      setCc('');
      setSubject(`Fwd: ${originalEmail?.subject || ''}`);
      const originalBody = originalEmail?.bodyText || originalEmail?.bodyHtml || '';
      const fromLine = `\n\n---\nForwarded message from ${originalEmail?.fromName || originalEmail?.fromEmail || 'someone'} <${originalEmail?.fromEmail || ''}>:\n\n`;
      setBody(fromLine + originalBody);
      setShowCc(false);
    } else {
      // Compose mode
      setTo('');
      setCc('');
      setSubject('');
      setBody('');
      setShowCc(false);
    }
    setErrors({});
  }, [isOpen, mode, originalEmail]);

  // Focus trap and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Focus first input when modal opens
    const firstInput = modalRef.current?.querySelector('input');
    firstInput?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Parse email addresses (handles simple comma-separated format)
  const parseEmails = (emailString: string): string[] => {
    return emailString
      .split(',')
      .map(e => e.trim())
      .filter(Boolean)
      .filter(isValidEmail);
  };

  // Convert plain text to HTML safely
  const textToHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!mailboxId) {
      newErrors.mailbox = 'No mailbox selected. Please ensure you have connected a mailbox.';
    }

    if (!to.trim()) {
      newErrors.to = 'Please enter at least one recipient';
    } else {
      const toEmails = parseEmails(to);
      if (toEmails.length === 0) {
        newErrors.to = 'Please enter at least one valid email address';
      } else if (toEmails.length > 500) {
        newErrors.to = 'Cannot exceed 500 recipients';
      }
    }

    if (cc) {
      const ccEmails = parseEmails(cc);
      if (ccEmails.length > 500) {
        newErrors.cc = 'Cannot exceed 500 CC recipients';
      }
    }

    if (subject && subject.length > 998) {
      newErrors.subject = 'Subject cannot exceed 998 characters';
    }

    // Estimate body size (rough calculation: 1 char ≈ 1 byte for UTF-8)
    const bodySize = new Blob([body]).size;
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (bodySize > maxSize) {
      newErrors.body = `Email body is too large (${(bodySize / 1024 / 1024).toFixed(2)}MB). Maximum size is 25MB.`;
    }

    if (!body.trim()) {
      newErrors.body = 'Email body cannot be empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (!validateForm()) {
      return;
    }
    
    // Parse comma-separated emails
    const toEmails = parseEmails(to);
    const ccEmails = cc ? parseEmails(cc) : undefined;
    
    // Validate total recipient count
    const totalRecipients = toEmails.length + (ccEmails?.length || 0);
    if (totalRecipients > 500) {
      setErrors({ 
        to: `Total recipients (to + cc) cannot exceed 500. You have ${totalRecipients}.` 
      });
      return;
    }
    
    sendEmail.mutate({
      mailboxId: mailboxId!,
      to: toEmails,
      cc: ccEmails,
      subject: subject || '(No subject)',
      body: body.trim(),
      bodyHtml: textToHtml(body.trim()),
      inReplyTo: (mode === 'reply' || mode === 'replyAll') ? originalEmail?.gmailMessageId : undefined,
      threadId: (mode === 'reply' || mode === 'replyAll') ? originalEmail?.gmailThreadId : undefined,
    }, {
      onSuccess: () => {
        onClose();
      },
      onError: (error: Error) => {
        setErrors({ 
          general: error.message || 'Failed to send email. Please try again.' 
        });
      },
    });
  };

  const getTitle = () => {
    switch (mode) {
      case 'reply':
        return 'Reply';
      case 'replyAll':
        return 'Reply All';
      case 'forward':
        return 'Forward';
      default:
        return 'New Message';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compose-email-title"
    >
      <div 
        ref={modalRef}
        className="bg-white w-full max-w-3xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
          <h2 id="compose-email-title" className="text-lg font-semibold">{getTitle()}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-200"
            aria-label="Close compose email modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Error Messages */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mx-4 mt-4 rounded-md text-sm">
            {errors.general}
          </div>
        )}

        {/* Form */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {/* To Field */}
          <div className="flex items-start gap-2">
            <Label htmlFor="to" className="w-12 text-right text-sm text-gray-600 pt-2">To</Label>
            <div className="flex-1">
              <Input
                id="to"
                type="text"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  if (errors.to) setErrors(prev => ({ ...prev, to: '' }));
                }}
                placeholder="Recipients (comma-separated)"
                className={`border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-blue-500 transition-colors ${errors.to ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.to}
                aria-describedby={errors.to ? 'to-error' : undefined}
              />
              {errors.to && (
                <p id="to-error" className="text-red-600 text-xs mt-1">{errors.to}</p>
              )}
              {!showCc && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                >
                  Cc
                </Button>
              )}
            </div>
          </div>

          {/* Cc Field */}
          {showCc && (
            <div className="flex items-start gap-2">
              <Label htmlFor="cc" className="w-12 text-right text-sm text-gray-600 pt-2">Cc</Label>
              <div className="flex-1">
                <Input
                  id="cc"
                  type="text"
                  value={cc}
                  onChange={(e) => {
                    setCc(e.target.value);
                    if (errors.cc) setErrors(prev => ({ ...prev, cc: '' }));
                  }}
                  placeholder="Carbon copy (comma-separated)"
                  className={`flex-1 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-blue-500 transition-colors ${errors.cc ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.cc}
                  aria-describedby={errors.cc ? 'cc-error' : undefined}
                />
                {errors.cc && (
                  <p id="cc-error" className="text-red-600 text-xs mt-1">{errors.cc}</p>
                )}
              </div>
            </div>
          )}

          {/* Subject Field */}
          <div className="flex items-start gap-2">
            <Label htmlFor="subject" className="w-12 text-right text-sm text-gray-600 pt-2">Subject</Label>
            <div className="flex-1">
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors.subject) setErrors(prev => ({ ...prev, subject: '' }));
                }}
                placeholder="Subject"
                maxLength={998}
                className={`flex-1 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-blue-500 transition-colors ${errors.subject ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? 'subject-error' : undefined}
              />
              {errors.subject && (
                <p id="subject-error" className="text-red-600 text-xs mt-1">{errors.subject}</p>
              )}
              {subject.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{subject.length}/998 characters</p>
              )}
            </div>
          </div>

          {/* Body Field */}
          <div className="pt-2">
            <textarea
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (errors.body) setErrors(prev => ({ ...prev, body: '' }));
              }}
              placeholder="Type your message here..."
              className={`w-full min-h-[300px] p-2 resize-none focus:outline-none border rounded ${errors.body ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={!!errors.body}
              aria-describedby={errors.body ? 'body-error' : undefined}
            />
            {errors.body && (
              <p id="body-error" className="text-red-600 text-xs mt-1">{errors.body}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Attach file"
              className="h-8 w-8"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Insert image"
              className="h-8 w-8"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Insert emoji"
              className="h-8 w-8"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Discard
            </Button>
            <Button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={sendEmail.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sendEmail.isPending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
