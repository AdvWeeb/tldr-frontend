import { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Image as ImageIcon, File as FileIcon, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEmailMutations } from '@/hooks/useEmail';
import { toast } from 'sonner';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);

  // Initialize form when modal opens or props change
  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setTo('');
      setCc('');
      setSubject('');
      setAttachments([]);
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
    

  // Handle file attachments
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Filter by type if image
    const validFiles = type === 'image' 
      ? files.filter(f => f.type.startsWith('image/'))
      : files;

    if (validFiles.length !== files.length && type === 'image') {
      toast.error('Some files were not images and were skipped');
    }

    // Check total size (25MB limit for all attachments combined)
    const currentSize = attachments.reduce((sum, f) => sum + f.size, 0);
    const newSize = validFiles.reduce((sum, f) => sum + f.size, 0);
    const totalSize = currentSize + newSize;
    const maxSize = 25 * 1024 * 1024; // 25MB

    if (totalSize > maxSize) {
      toast.error(`Total attachment size cannot exceed 25MB. Current: ${((currentSize + newSize) / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    // Check file count (max 10 files)
    if (attachments.length + validFiles.length > 10) {
      toast.error('Cannot attach more than 10 files');
      return;
    }

    setAttachments(prev => [...prev, ...validFiles]);
    toast.success(`Added ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`);

    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
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
      attachments: attachments.length > 0 ? attachments : undefined,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/60 backdrop-blur-sm p-4"
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
        className="bg-white w-full max-w-3xl rounded-[2rem] border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FFF8F0] px-6 py-4 border-b-2 border-[#0A0A0A]/10 flex justify-between items-center">
          <h2 id="compose-email-title" className="text-2xl font-bold text-[#0A0A0A]">{getTitle()}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-white border-2 border-transparent hover:border-[#0A0A0A] transition-all"
            aria-label="Close compose email modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Error Messages */}
        {errors.general && (
          <div className="bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] text-[#0A0A0A] px-5 py-3 mx-6 mt-6 rounded-xl text-sm font-semibold">
            {errors.general}
          </div>
        )}

        {/* Form */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* To Field */}
          <div className="flex items-start gap-3">
            <Label htmlFor="to" className="w-16 text-right text-sm font-semibold text-[#0A0A0A]/60 pt-2.5">To</Label>
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
                className={`border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-[#10F9A0] transition-colors font-medium ${errors.to ? 'border-[#FF6B6B]' : 'border-[#0A0A0A]/20'}`}
                aria-invalid={!!errors.to}
                aria-describedby={errors.to ? 'to-error' : undefined}
              />
              {errors.to && (
                <p id="to-error" className="text-[#FF6B6B] text-xs mt-1.5 font-semibold">{errors.to}</p>
              )}
              {!showCc && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(true)}
                  className="text-xs font-semibold text-[#0A0A0A] hover:text-[#10F9A0] mt-1.5 px-0"
                >
                  + Add Cc
                </Button>
              )}
            </div>
          </div>

          {/* Cc Field */}
          {showCc && (
            <div className="flex items-start gap-3">
              <Label htmlFor="cc" className="w-16 text-right text-sm font-semibold text-[#0A0A0A]/60 pt-2.5">Cc</Label>
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
                  className={`flex-1 border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-[#10F9A0] transition-colors font-medium ${errors.cc ? 'border-[#FF6B6B]' : 'border-[#0A0A0A]/20'}`}
                  aria-invalid={!!errors.cc}
                  aria-describedby={errors.cc ? 'cc-error' : undefined}
                />
                {errors.cc && (
                  <p id="cc-error" className="text-[#FF6B6B] text-xs mt-1.5 font-semibold">{errors.cc}</p>
                )}
              </div>
            </div>
          )}

          {/* Subject Field */}
          <div className="flex items-start gap-3">
            <Label htmlFor="subject" className="w-16 text-right text-sm font-semibold text-[#0A0A0A]/60 pt-2.5">Subject</Label>
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
                className={`flex-1 border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-[#10F9A0] transition-colors font-medium ${errors.subject ? 'border-[#FF6B6B]' : 'border-[#0A0A0A]/20'}`}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? 'subject-error' : undefined}
              />
              {errors.subject && (
                <p id="subject-error" className="text-[#FF6B6B] text-xs mt-1.5 font-semibold">{errors.subject}</p>
              )}
              {subject.length > 0 && (
                <p className="text-xs text-[#0A0A0A]/50 mt-1.5 font-medium">{subject.length}/998 characters</p>
              )}
            </div>
          </div>

          {/* Body Field */}
          <div className="pt-3">
            <textarea
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (errors.body) setErrors(prev => ({ ...prev, body: '' }));
              }}
              placeholder="Type your message here..."
              className={`w-full min-h-[300px] p-4 resize-none focus:outline-none border-2 rounded-xl font-medium text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 transition-colors ${errors.body ? 'border-[#FF6B6B] focus:border-[#FF6B6B]' : 'border-[#0A0A0A]/20 focus:border-[#10F9A0]'}`}
              aria-invalid={!!errors.body}
              aria-describedby={errors.body ? 'body-error' : undefined}
            />
            {errors.body && (
              <p id="body-error" className="text-[#FF6B6B] text-xs mt-1.5 font-semibold">{errors.body}</p>
            )}
          </div>

          {/* Attachments Display */}
          {attachments.length > 0 && (
            <div className="pt-4 border-t-2 border-[#0A0A0A]/10">
              <Label className="text-sm font-semibold uppercase tracking-wide text-[#0A0A0A]/60 mb-3 block">
                Attachments ({attachments.length})
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white border-2 border-[#0A0A0A]/10 rounded-xl hover:border-[#10F9A0] hover:shadow-[2px_2px_0px_0px_rgba(16,249,160,1)] transition-all duration-200"
                  >
                    {file.type.startsWith('image/') ? (
                      <div className="h-10 w-10 bg-[#C77DFF] border-2 border-[#0A0A0A] rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-[#10F9A0] border-2 border-[#0A0A0A] rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileIcon className="h-5 w-5 text-[#0A0A0A]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-[#0A0A0A]">{file.name}</p>
                      <p className="text-xs text-[#0A0A0A]/60 font-medium">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0 rounded-full hover:bg-[#FF6B6B]/10"
                      onClick={() => removeAttachment(index)}
                      title="Remove attachment"
                    >
                      <XCircle className="h-4 w-4 text-[#FF6B6B]" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#0A0A0A]/50 mt-3 font-medium">
                Total size: {formatFileSize(attachments.reduce((sum, f) => sum + f.size, 0))} / 25 MB
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FFF8F0] px-6 py-4 border-t-2 border-[#0A0A0A]/10 flex justify-between items-center">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'file')}
              accept="*/*"
            />
            <input
              ref={imageInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'image')}
              accept="image/*"
            />
            <Button
              variant="ghost"
              size="icon"
              title="Attach file"
              className="h-9 w-9 rounded-full hover:bg-white border-2 border-transparent hover:border-[#0A0A0A] transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Insert image"
              className="h-9 w-9 rounded-full hover:bg-white border-2 border-transparent hover:border-[#0A0A0A] transition-all"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-5 py-2 font-semibold hover:bg-[#FFF8F0] transition-colors"
            >
              Discard
            </Button>
            <Button
              onClick={handleSend}
              className="bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-6 py-2 font-semibold shadow-[3px_3px_0px_0px_rgba(10,10,10,1)] hover:shadow-[5px_5px_0px_0px_rgba(10,10,10,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[3px_3px_0px_0px_rgba(10,10,10,1)] disabled:hover:scale-100 disabled:hover:translate-y-0"
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
