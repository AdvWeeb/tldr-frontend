# Email Sending Feature Implementation

## Overview
Complete implementation of email sending functionality with support for composing new emails, replying, replying to all, and forwarding emails through the Gmail API.

## Backend Implementation

### 1. SendEmailDto (`tldr-backend/src/modules/email/dto/send-email.dto.ts`)
- **Purpose**: Data Transfer Object for email sending API
- **Fields**:
  - `mailboxId` (number, required): ID of the mailbox to send from
  - `to` (string[], required): Array of recipient email addresses
  - `cc` (string[], optional): Carbon copy recipients
  - `bcc` (string[], optional): Blind carbon copy recipients
  - `subject` (string, required): Email subject
  - `body` (string, required): Plain text body
  - `bodyHtml` (string, optional): HTML body
  - `inReplyTo` (string, optional): Gmail message ID for threading replies
  - `threadId` (string, optional): Gmail thread ID for threading replies
- **Validation**: Uses class-validator decorators
- **Documentation**: Swagger/OpenAPI decorators

### 2. GmailService.sendEmail() (`tldr-backend/src/modules/mailbox/providers/gmail.service.ts`)
- **Purpose**: Handles Gmail API integration for sending emails
- **Implementation**:
  - Builds RFC 2822 formatted email messages
  - Creates multipart/alternative MIME structure (plain text + HTML)
  - Adds threading headers (In-Reply-To, References) for replies
  - Base64url encodes the message for Gmail API
  - Calls `gmail.users.messages.send()` with optional threadId
  - Returns Gmail message ID

### 3. EmailService.sendEmail() (`tldr-backend/src/modules/email/email.service.ts`)
- **Purpose**: Business logic layer for email sending
- **Implementation**:
  - Verifies mailbox ownership (ensures user owns the mailbox)
  - Delegates to GmailService.sendEmail()
  - Logs sent email
  - Returns `{messageId: string}`

### 4. EmailController POST /emails/send (`tldr-backend/src/modules/email/email.controller.ts`)
- **Endpoint**: `POST /v1/emails/send`
- **Request Body**: SendEmailDto
- **Response**: `{messageId: string}`
- **Authentication**: Protected by JWT guard
- **Documentation**: Swagger decorators with operation and response schemas

## Frontend Implementation

### 1. Email API Service (`tldr/src/services/emailApi.ts`)
- **Added Interface**: `SendEmailData` with all required fields
- **Added Method**: `sendEmail(data: SendEmailData) => Promise<{messageId: string}>`
- **Implementation**: POST request to `/emails/send` endpoint

### 2. React Query Hook (`tldr/src/hooks/useEmail.ts`)
- **Added Hook**: `sendEmail` mutation in `useEmailMutations()`
- **Behavior**:
  - Calls `emailApi.sendEmail()`
  - On success: Invalidates `['emails']` and `['mailboxes']` queries to refresh data
  - Returns mutation object with `mutate()`, `isPending`, etc.

### 3. ComposeEmailModal (`tldr/src/components/dashboard/ComposeEmailModal.tsx`)
- **Enhanced Props**:
  - Added `mailboxId` (required for sending)
  - Added `gmailMessageId` and `gmailThreadId` to originalEmail (for threading)
- **Implementation**:
  - Uses `useSendEmail()` mutation
  - Parses comma-separated email strings to arrays
  - Simple plain text to HTML conversion (`\n` → `<br>`)
  - Passes threading info for replies (inReplyTo, threadId)
  - Shows loading state during send ("Sending...")
  - Resets form on success
  - Shows error alert on failure
- **Modes Supported**:
  - **Compose**: Empty form
  - **Reply**: Pre-fills To, Subject (Re:), Body with quote
  - **Reply All**: Pre-fills To, Cc, Subject (Re:), Body with quote
  - **Forward**: Pre-fills Subject (Fwd:), Body with quote

### 4. EmailDetail (`tldr/src/components/dashboard/EmailDetail.tsx`)
- **Enhanced Props**: Added `mailboxId` prop
- **Implementation**:
  - Passes `mailboxId` to ComposeEmailModal
  - Passes `gmailMessageId` and `gmailThreadId` for threading
  - Reply/Reply All/Forward buttons open modal with correct mode

### 5. Inbox Page (`tldr/src/pages/Inbox.tsx`)
- **Implementation**: Passes `mailboxId={selectedMailboxId!}` to EmailDetail

## Features

### Compose New Email
1. User clicks "Compose" button (to be added to UI)
2. Modal opens in 'compose' mode with empty form
3. User fills To, Cc (optional), Subject, Body
4. Click "Send" → API call → Email sent via Gmail

### Reply to Email
1. User clicks "Reply" button in EmailDetail
2. Modal opens with:
   - To: Original sender
   - Subject: "Re: [original subject]"
   - Body: Quote of original email with header
   - inReplyTo: Original email's Gmail message ID
   - threadId: Original email's Gmail thread ID
3. Click "Send" → Email sent as part of thread

### Reply All
1. User clicks "Reply All" button in EmailDetail
2. Modal opens with:
   - To: Original sender
   - Cc: All original Cc recipients
   - Subject: "Re: [original subject]"
   - Body: Quote of original email
   - Threading info included
3. Click "Send" → All recipients receive reply

### Forward Email
1. User clicks "Forward" button in EmailDetail
2. Modal opens with:
   - To: Empty (user must fill)
   - Subject: "Fwd: [original subject]"
   - Body: Quote of original email
   - No threading (new conversation)
3. Click "Send" → Email forwarded to new recipients

## Technical Details

### RFC 2822 Email Format
```
From: sender@example.com
To: recipient@example.com
Cc: cc@example.com
Subject: Email Subject
In-Reply-To: <original-message-id>
References: <original-message-id>
Content-Type: multipart/alternative; boundary="boundary"

--boundary
Content-Type: text/plain; charset="UTF-8"

Plain text body

--boundary
Content-Type: text/html; charset="UTF-8"

<html><body>HTML body</body></html>

--boundary--
```

### Gmail API Threading
- **inReplyTo**: Gmail message ID of the email being replied to
- **threadId**: Gmail thread ID to group related emails
- **References**: Header containing all message IDs in thread (handled by Gmail API)

### Error Handling
- Frontend: Shows alert with error message
- Backend: Returns appropriate HTTP status codes (400, 404, 500)
- Validation: DTO validation ensures data integrity

## Testing Checklist

- [ ] Compose and send new email
- [ ] Reply to email (verify threading)
- [ ] Reply All (verify all recipients receive)
- [ ] Forward email
- [ ] Send with CC recipients
- [ ] Send with BCC recipients
- [ ] Send email with no subject (defaults to "(No subject)")
- [ ] Error handling: invalid email addresses
- [ ] Error handling: mailbox not found
- [ ] Loading state during send
- [ ] Form resets after successful send
- [ ] Emails query refreshes after send

## Future Enhancements

1. **Rich Text Editor**: Replace textarea with WYSIWYG editor (TipTap, Quill)
2. **Attachments**: File upload support with Gmail API
3. **Drafts**: Auto-save drafts as user types
4. **Email Templates**: Pre-defined templates for common emails
5. **Signatures**: Auto-append user signature
6. **Scheduled Send**: Send emails at specified time
7. **Read Receipts**: Track when recipients open emails
8. **Undo Send**: Cancel send within 5-10 seconds
9. **Email Validation**: Real-time validation of email addresses
10. **BCC Field**: Add dedicated BCC field in UI

## Dependencies

### Backend
- `googleapis`: Gmail API client
- `class-validator`: DTO validation
- `@nestjs/swagger`: API documentation

### Frontend
- `@tanstack/react-query`: Data fetching and mutations
- `lucide-react`: Icons
- `shadcn/ui`: UI components (Button, Input, Label)

## Files Modified

### Backend
1. `tldr-backend/src/modules/email/dto/send-email.dto.ts` (NEW)
2. `tldr-backend/src/modules/email/dto/index.ts` (MODIFIED - added export)
3. `tldr-backend/src/modules/mailbox/providers/gmail.service.ts` (MODIFIED - added sendEmail method)
4. `tldr-backend/src/modules/email/email.service.ts` (MODIFIED - added sendEmail method)
5. `tldr-backend/src/modules/email/email.controller.ts` (MODIFIED - added POST /emails/send endpoint)

### Frontend
1. `tldr/src/services/emailApi.ts` (MODIFIED - added SendEmailData interface and sendEmail method)
2. `tldr/src/hooks/useEmail.ts` (MODIFIED - added sendEmail mutation)
3. `tldr/src/components/dashboard/ComposeEmailModal.tsx` (MODIFIED - wired to API)
4. `tldr/src/components/dashboard/EmailDetail.tsx` (MODIFIED - added mailboxId prop)
5. `tldr/src/pages/Inbox.tsx` (MODIFIED - passes mailboxId to EmailDetail)
6. `tldr/docs/EMAIL_SENDING_FEATURE.md` (NEW - this document)
