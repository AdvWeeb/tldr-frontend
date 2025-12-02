# Integration Testing Checklist

Use this checklist to verify the frontend-backend integration is working correctly.

## Prerequisites

- [ ] Backend is running on http://localhost:3000
- [ ] Frontend is running on http://localhost:5173
- [ ] PostgreSQL is running (check `docker compose ps`)
- [ ] Redis is running (optional - uses in-memory cache if not available)
- [ ] No console errors on page load

## 1. Environment Setup

- [ ] Backend `.env` file exists with all required variables
- [ ] Frontend `.env` file exists with `VITE_API_BASE_URL=/v1`
- [ ] Swagger docs accessible at http://localhost:3000/api/docs
- [ ] Frontend loads without errors

## 2. User Registration

- [ ] Navigate to login page (http://localhost:5173)
- [ ] Click "Register" or go to register page
- [ ] Fill in registration form:
  - Email: test@example.com
  - Password: Test123!
  - First Name: Test
  - Last Name: User
- [ ] Submit form
- [ ] Check Network tab: POST /v1/auth/register returns 201
- [ ] Response includes `accessToken` and `refreshToken`
- [ ] Automatically redirected to dashboard
- [ ] Check localStorage: `refreshToken` is present
- [ ] Check Zustand DevTools: `accessToken` and `isAuthenticated: true`

## 3. User Login

- [ ] Logout (if logged in)
- [ ] Navigate to login page
- [ ] Enter credentials from registration
- [ ] Submit form
- [ ] Check Network tab: POST /v1/auth/login returns 200
- [ ] Response includes tokens
- [ ] Redirected to dashboard
- [ ] localStorage has refreshToken
- [ ] Zustand has accessToken

## 4. Token Refresh

### Manual Test (Quick)
- [ ] Open Browser DevTools → Application → Local Storage
- [ ] Note the current `refreshToken` value
- [ ] Open Console and run: `localStorage.removeItem('refreshToken')`
- [ ] Wait for any API call (or refresh page)
- [ ] Should redirect to login page

### Automatic Test (15-minute wait)
- [ ] Login successfully
- [ ] Wait 15 minutes (access token expiry)
- [ ] Make an API call (navigate to different page)
- [ ] Check Network tab: POST /v1/auth/refresh is called
- [ ] New tokens returned
- [ ] localStorage refreshToken updated (different value)
- [ ] Original request retried successfully
- [ ] No logout/redirect occurred

## 5. User Profile

- [ ] While logged in, check Network tab for: GET /v1/users/me
- [ ] Response includes user data (id, email, firstName, lastName)
- [ ] User name displayed in navigation (top right)
- [ ] Avatar or initials shown

## 7. Mailbox Operations

### List Mailboxes
- [ ] Navigate to dashboard
- [ ] Check Network tab: GET /v1/mailboxes is called
- [ ] Sidebar shows "Mailboxes" section
- [ ] If no mailboxes, shows empty state

### Connect Gmail (OAuth Working)
- [ ] Click "Connect Gmail" or "Sign in with Google" button
- [ ] OAuth flow initiates (redirects to Google)
- [ ] Approve permissions on Google consent screen
- [ ] After OAuth: redirects back to app
- [ ] POST /v1/auth/google completes successfully
- [ ] New mailbox appears in sidebar (if connecting mailbox)
- [ ] Background sync starts automatically

## 8. Email Operations

### List Emails
- [ ] Click on a mailbox
- [ ] Check Network tab: GET /v1/emails?mailboxId=1&page=1&limit=50
- [ ] Email list loads in center column
- [ ] Pagination controls visible if > 50 emails
- [ ] Email count displayed

### View Email Detail
- [ ] Click on an email in list
- [ ] Email detail pane opens
- [ ] Check Network tab: GET /v1/emails/:id
- [ ] Subject, sender, date displayed
- [ ] Email body rendered (HTML or text)

### Star Email
- [ ] Click star icon on email
- [ ] Check Network tab: PATCH /v1/emails/:id with `{"isStarred": true}`
- [ ] Star icon fills in
- [ ] Email list updates immediately
- [ ] Query invalidation works (no refresh needed)

### Mark as Read/Unread
- [ ] Click on unread email
- [ ] Email marked as read automatically
- [ ] Check Network tab: PATCH /v1/emails/:id with `{"isRead": true}`
- [ ] Bold text changes to normal
- [ ] Unread count updates in sidebar

### Delete Email
- [ ] Click delete button on email
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Check Network tab: DELETE /v1/emails/:id
- [ ] Email removed from list
- [ ] Count updates

### Filter Emails
- [ ] Use search box
- [ ] Enter search term
- [ ] Check Network tab: GET /v1/emails?search=term
- [ ] Filtered results display
- [ ] Clear search → full list returns

### Pagination
- [ ] If > 50 emails, pagination controls appear
- [ ] Click "Next" button
- [ ] Check Network tab: GET /v1/emails?page=2
- [ ] New page loads
- [ ] Page number updates
- [ ] "Previous" button enabled

## 8. Task Operations

- [ ] Click "Convert to Task" on email
- [ ] Task status dropdown appears
- [ ] Select "Todo"
- [ ] Check Network tab: PATCH /v1/emails/:id with `{"taskStatus": "todo"}`
- [ ] Task indicator appears on email
- [ ] Change status to "In Progress"
- [ ] Change status to "Done"
- [ ] Each change triggers PATCH request

## 9. Sync Operations

- [ ] Click "Sync" button on mailbox
- [ ] Check Network tab: POST /v1/mailboxes/:id/sync
- [ ] Loading indicator appears
- [ ] After sync: new emails appear (if any)
- [ ] Counts update

## 10. Logout

- [ ] Click user menu (top right)
- [ ] Click "Logout"
- [ ] Check Network tab: POST /v1/auth/logout
- [ ] localStorage cleared (no refreshToken)
- [ ] Zustand cleared (no accessToken)
- [ ] Redirected to login page
- [ ] Accessing protected route redirects to login

## 11. Error Handling

### Invalid Credentials
- [ ] Enter wrong password on login
- [ ] Error message displayed
- [ ] Network tab shows 401 Unauthorized
- [ ] Not redirected

### Network Error
- [ ] Stop backend server
- [ ] Try to login
- [ ] Error message: "Network Error" or similar
- [ ] Graceful error handling

### Token Expiry (Manual)
- [ ] Login successfully
- [ ] In DevTools Console: `localStorage.setItem('refreshToken', 'invalid')`
- [ ] Navigate or refresh
- [ ] Refresh fails
- [ ] Logout automatic
- [ ] Redirect to login

### Rate Limiting
- [ ] Try to login 10 times rapidly with wrong password
- [ ] Should get 429 Too Many Requests
- [ ] Error message displayed

### OAuth Errors
- [ ] Try OAuth with wrong redirect URI configured
- [ ] Should see "redirect_uri_mismatch" error
- [ ] Click Cancel on Google consent screen
- [ ] Should see "access_denied" error (normal behavior)

## 12. React Query Devtools

- [ ] Open React Query Devtools (usually bottom of screen)
- [ ] See queries: ['mailboxes'], ['emails', params], ['email', id]
- [ ] Check stale time, cache time
- [ ] Mutations show in "Mutations" tab
- [ ] Invalidation triggers refetch

## 13. Axios Interceptor

- [ ] In DevTools Network tab, filter: XHR
- [ ] Check all requests have: `Authorization: Bearer <token>`
- [ ] Check 401 responses trigger refresh
- [ ] Check retry after refresh succeeds

## 14. Performance

- [ ] Initial page load < 2 seconds
- [ ] Email list renders smoothly (no lag)
- [ ] Filtering is instant (debounced)
- [ ] Pagination changes are fast
- [ ] No memory leaks (check in DevTools Memory tab)

## 15. Responsive Design

- [ ] Test on desktop (1920x1080)
  - [ ] 3 columns visible
  - [ ] All features accessible
  
- [ ] Test on tablet (768x1024)
  - [ ] 2 columns visible
  - [ ] Navigation adapts
  
- [ ] Test on mobile (375x667)
  - [ ] 1 column visible
  - [ ] Hamburger menu works

## 16. Browser Compatibility

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Edge
- [ ] Test in Safari (if on Mac)

## Common Issues & Solutions

### Issue: "redirect_uri_mismatch"
**Solution**: Add http://localhost:5173/auth/callback to Google Cloud Console authorized redirect URIs

### Issue: "Network Error"
**Solution**: Check backend is running, verify proxy in vite.config.ts

### Issue: "401 on all requests"
**Solution**: Clear localStorage, login again

### Issue: Refresh token loop
**Solution**: Check backend returns NEW refresh token, update both tokens

### Issue: CORS error
**Solution**: Backend .env must have CORS_ORIGINS=http://localhost:5173 (environment-driven)

### Issue: "Cannot read property 'user' of undefined"
**Solution**: User data fetch failed, check GET /v1/users/me endpoint

## Success Criteria

All checkboxes above should be checked for complete integration verification.

## Automated Testing (Future)

Consider adding:
- [ ] E2E tests with Playwright/Cypress
- [ ] Integration tests for API calls
- [ ] Component tests with React Testing Library
- [ ] Visual regression tests

---

**Last Updated**: December 2, 2025
**Tested By**: _____________
**Status**: ⬜ Pass | ⬜ Fail | ⬜ Partial
**Notes**: _____________________________________________
