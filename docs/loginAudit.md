# Authentication and RBAC Audit

**Jira task:** KAN-124  
**Project*** Shahebbazar  
**Audit area:** User authentication, session handling and role-based access control  
**Status:** RBAC foundation implemented; login and registration workflow in progress  
**Login method:** Phone verification with development-only mock delivery  
**Branch:** `ari/feature-rbac`

> **Client decision update, 7 October 2026:** Phone verification will be used
> for Phase 1. Only SMS delivery is mocked. Code generation, hashing, expiry,
> attempts, consumption, session creation and RBAC remain real application
> behaviour.

---

## 1. Purpose

This audit evaluates authentication and role-based access control against the client requirement for three roles:

```text
customer
vendor
admin
```

Live SMS delivery is deferred because of provider costs. During local development, verification codes are delivered through the backend terminal.

The current work covers:

- Customer registration
- Customer login
- Vendor login
- Verified vendor registration
- Server-side sessions
- Role and ownership enforcement
- Migration away from seeded identities

---

## 2. Current Role and Database Model

The `users.user_role` field allows:

```text
customer
vendor
admin
```

The database also supports:

- Active, suspended and deleted users
- Vendor ownership through `vendors.user_id`
- OTP records through `otp_codes`
- Server-side sessions through `sessions`
- Session expiration
- Hashed session tokens
- Phone-verification timestamps

### Current application status

```text
Database role model:              Present
Customer identity:                Seeded helper
Vendor identity:                  URL-derived or seeded helper
Admin identity:                   Seeded helper
Session resolution:               Implemented
Authentication middleware:       Implemented
Role middleware:                 Implemented
Vendor ownership middleware:     Implemented
Frontend route protection:       Placeholder only
Customer login page:             Missing, currently returns 404
Customer registration page:      Missing
Vendor login page:               Missing
Vendor registration page:        Present but not phone-verified
OTP request endpoint:            Implemented
OTP confirmation:                Not implemented
Session issuance:                Not implemented
Logout:                          Not implemented
```

---

## 3. Protected Frontend Route Audit

The application contains three private route groups:

```text
(seeker)
(provider)
(admin)
```

Files:

```text
frontend/shahebbazar/app/(seeker)/layout.tsx
frontend/shahebbazar/app/(provider)/layout.tsx
frontend/shahebbazar/app/(admin)/layout.tsx
```

These layouts currently organise pages but do not enforce authentication or roles.

Current behaviour:

```text
Anonymous visitor
→ opens private URL
→ page renders
```

The layouts include:

```ts
robots: {
    index: false,
    follow: false
}
```

This prevents search-engine indexing. It does not provide access control.

---

## 4. Simulated Identities

### Customer identity

Customer routes currently use:

```js
const userId = await currentCustomerId();
```

The helper selects the first active seeded customer. Customer actions are therefore not linked to the real HTTP caller.

Affected functionality includes:

- Account details
- Saved businesses
- Reviews
- Reports
- Conversations
- Messages
- Alerts

Required replacement:

```js
const userId = req.user.user_id;
```

This must only occur after applying:

```js
requireAuthenticatedUser
```

### Administrator identity

Admin routes currently use:

```js
const actor = await currentAdminId(client);
```

This selects a seeded administrator without proving that the caller is an administrator.

Required replacement:

```js
requireRole("admin")
```

and:

```js
const actor = req.user.user_id;
```

---

## 5. Vendor Ownership and Exposure Risks

The current vendor helper identifies who owns a vendor:

```js
async function vendorOwnerId(vendorId, db = pool) {
    const result = await db.query(
        "SELECT user_id FROM vendors WHERE vendor_id = $1",
        [vendorId]
    );

    return result.rows[0]?.user_id ?? null;
}
```

It does not prove that the signed-in caller owns that vendor.

Protected vendor operations must use:

```js
requireAuthenticatedUser
requireVendorOwnership
```

Routes should operate on:

```js
req.vendor.vendor_id
```

### High-priority routes

Priority protection is required for:

1. Vendor conversation replies
2. Vendor owner-account details
3. Vendor listing management
4. Vendor and listing photo management
5. Vendor profile editing
6. Vendor payment methods
7. Vendor review replies
8. Admin moderation decisions
9. Admin reports and review controls
10. Customer messages, alerts, saved businesses and reviews

The owner endpoint also exposes private account information:

```text
GET /api/vendors/:vendorId/owner
```

It must require the owning vendor or an administrator.

---

## 6. Proposed Access Matrix

| Area | Anonymous | Customer | Vendor | Admin |
| --- | ---: | ---: | ---: | ---: |
| Public browsing | Yes | Yes | Yes | Yes |
| Customer registration | Yes | No | No | No |
| Vendor registration | Yes | Yes | Yes | Yes |
| Customer account | No | Yes | To confirm | To confirm |
| Customer features | No | Yes | To confirm | To confirm |
| Vendor dashboard | No | No | Yes | Yes |
| Vendor management | No | No | Owning vendor | Yes |
| Vendor messages | No | No | Owning vendor | Yes |
| Admin portal | No | No | No | Yes |
| Moderation | No | No | No | Yes |
| Admin analytics | No | No | No | Yes |

The team must confirm whether vendor and administrator accounts may also use customer-facing account features.

---

## 7. RBAC Foundation Implemented

File:

```text
backend/lib/middleware/auth.js
```

### Session resolution

The middleware:

1. Reads the `shaheb_session` cookie.
2. Hashes the submitted token with SHA-256.
3. Finds a matching active session.
4. Rejects expired sessions.
5. Rejects inactive users.
6. Populates `req.user` and `req.session`.

Resolved user contract:

```js
req.user = {
    user_id,
    user_name,
    user_phone,
    user_email,
    user_role
};
```

### Available middleware

```js
requireAuthenticatedUser
requireRole(...allowedRoles)
requireVendorOwnership
```

Expected behaviour:

```text
No valid session                 → 401
Wrong role                       → 403
Vendor accessing another vendor → 403
Owning vendor                    → continue
Administrator override           → continue
```

The middleware does not trust user IDs, roles or ownership claims supplied by the browser.

---

## 8. Global Session Resolution and Identity Endpoint

The backend runs:

```js
app.use(resolveSession);
```

before API route registration.

Public requests remain available without a session. Protected routes must apply the appropriate authentication middleware.

The following protected endpoint exists:

```text
GET /api/auth/me
```

A successful response returns safe account information:

```json
{
  "authenticated": true,
  "user": {
    "user_id": 57,
    "user_name": "Example User",
    "user_phone": "+8801700000000",
    "user_email": null,
    "user_role": "vendor"
  }
}
```

The endpoint does not return session tokens, token hashes, OTP hashes, password hashes, NID references or internal moderation information.

---

## 9. Completed Tests

### Anonymous session test

Request:

```text
GET /api/auth/me
```

Result:

```json
{
  "success": false,
  "error": "Authentication required"
}
```

HTTP status:

```text
401 Unauthorized
```

This confirms that anonymous requests do not receive a seeded identity.

### Mock verification request

Endpoint:

```text
POST /api/auth/request-verification
```

Confirmed:

- Valid phone and purpose return success.
- Bangladesh phone input is normalised.
- A secure six-digit code is generated.
- The raw code appears only in the local API terminal.
- The raw code is not returned by the API.
- PostgreSQL stores only the HMAC-SHA256 hash.
- Codes expire after five minutes.
- Attempt count begins at zero.
- Consumed timestamp begins as null.
- Invalid phone or purpose returns HTTP 400.
- Request limits return HTTP 429.
- API health remains operational.

No user or session is created by this endpoint.

---

## 10. Current Progress

```text
Database role model:                 Complete
OTP and session tables:              Present
Session resolution:                  Implemented
Authentication middleware:           Implemented
Role middleware:                     Implemented
Vendor ownership middleware:         Implemented
Anonymous 401 test:                  Passed
OTP request endpoint:                Implemented
Phone normalisation:                 Implemented
Secure code generation:              Implemented
OTP hashing and expiry:              Implemented
Request limiting:                    Implemented
Console mock delivery:               Implemented
OTP confirmation:                    Not started
OTP attempt handling:                Not started
OTP consumption:                     Not started
Session creation:                    Not started
Session-cookie issuance:             Not started
Logout:                              Not started
Customer registration page:         Planned
Customer login page:                 Planned
Vendor login page:                   Planned
Verified vendor registration:        Planned
Frontend session restoration:        Not started
Protected frontend layouts:          Not started
Route migration from seeded users:   Not started
```

---

## 11. Confirmed Authentication Decision

Phase 1 will use phone verification with development-only mock delivery.

Confirmed requirements:

- Six-digit verification codes
- Five-minute expiry
- Secure code generation
- HMAC-SHA256 hashing
- Request and attempt limits
- One-time code consumption
- Phone-verification timestamps
- Server-side sessions
- HTTP-only session cookies
- Database-enforced roles and ownership
- Console-only mock delivery outside production

Raw codes must not be returned by the API, stored in PostgreSQL or included in commits and project evidence.

Recommended defaults requiring team confirmation:

```text
Maximum verification attempts: 5
Session duration:              7 days
Resend policy:                 New code invalidates older active codes
```

---

## 12. Registration and Login Plan

### Current frontend gaps

The application currently has:

- A vendor-registration page
- No customer-registration page
- No customer-login page
- No vendor-login page
- A `/login` link that returns 404
- A Register button that links directly to vendor registration

### Planned routes

```text
/login
/register
/register/customer
/vendors/login
/vendors/register
```

The main Register button will point to:

```text
/register
```

This page will offer:

- Create a customer account
- Register a business

### Customer registration

```text
Enter name, phone and optional email
→ request registration code
→ enter code from the API terminal
→ verify and consume code
→ create customer account
→ create session
→ redirect to /account
```

The account must use:

```text
users.user_role = customer
```

No vendor record will be created.

### Customer login

```text
Enter registered phone number
→ request login code
→ enter and verify code
→ create session
→ redirect to /account
```

Unknown phone numbers must not create accounts automatically.

### Vendor login

```text
Enter the phone connected to a vendor account
→ request and verify code
→ resolve stored vendor role
→ create session
→ redirect to /vendors/dashboard
```

The backend determines the stored role. The frontend cannot declare an account as a vendor or administrator.

### Vendor registration

The current vendor form immediately creates a user and vendor before phone verification.

The replacement flow will be:

```text
Enter owner details
→ request and verify registration code
→ enter business details
→ create vendor-role user
→ mark phone as verified
→ create pending vendor profile
→ create session
→ redirect to completion or dashboard page
```

These states remain unchanged:

```text
vendor_status = pending
vendor_nid_status = pending
```

### Shared verification interface

All four flows will share phone and verification-code components.

After requesting a code, the frontend will display:

```text
Development mode: check the API terminal for the verification code.
```

The actual code must not appear in the browser.

---

## 13. Planned Files and Endpoints

### New frontend files

```text
frontend/shahebbazar/app/(public)/login/page.tsx
frontend/shahebbazar/app/(public)/register/page.tsx
frontend/shahebbazar/app/(public)/register/customer/page.tsx
frontend/shahebbazar/app/(public)/vendors/login/page.tsx
frontend/shahebbazar/components/auth/
frontend/shahebbazar/lib/auth-client.ts
frontend/shahebbazar/lib/authenticated-api.ts
```

### Existing frontend files to update

```text
frontend/shahebbazar/app/(public)/vendors/register/page.tsx
frontend/shahebbazar/components/shared/SiteHeader.tsx
frontend/shahebbazar/lib/i18n.ts
```

All new pages must support English and Bangla.

### Required backend endpoints

```text
POST /api/auth/request-verification
POST /api/auth/verify
POST /api/auth/register/customer
POST /api/auth/register/vendor
GET  /api/auth/me
POST /api/auth/logout
```

Only `request-verification` and the protected `me` endpoint currently exist.

---

## 14. Session and Frontend Requirements

Authentication requests must include:

```js
credentials: "include"
```

The frontend must not store session tokens in:

- Local storage
- Session storage
- URL parameters
- React state
- Visible form fields

Next.js server-side requests to protected Express endpoints must forward the incoming cookie.

Without cookie forwarding, the browser may be logged in while server-rendered account pages still appear anonymous.

Session cookies must:

- Be HTTP-only
- Use an explicit SameSite policy
- Use Secure in production
- Have an explicit expiry
- Be cleared during logout

PostgreSQL must store only the session-token hash.

---

## 15. Implementation Order

```text
1. Add registration-choice page
2. Add customer login page
3. Add vendor login page
4. Add customer registration page
5. Add shared verification interface
6. Add English and Bangla copy
7. Connect request-verification
8. Implement OTP confirmation and attempts
9. Implement customer registration
10. Implement verified vendor registration
11. Implement session creation and logout
12. Forward cookies through Next.js requests
13. Protect private route groups
14. Replace seeded identities
15. Apply role and ownership middleware
16. Complete session and RBAC testing
```

The public interface will be implemented first for visible client-demo progress.

The interface must not report a successful login or registration until backend verification and session creation succeed.

---

## 16. Required Tests

### OTP and session tests

- Valid code succeeds.
- Incorrect code fails and increments attempts.
- Attempt limit is enforced.
- Expired code fails.
- Consumed code fails.
- Code cannot be reused.
- Purpose mismatch fails.
- Successful verification creates a session.
- Session survives browser refresh.
- Invalid, expired and inactive-user sessions return HTTP 401.
- Logout removes the session and cookie.

### Role and ownership tests

- Customer can access customer functionality.
- Customer cannot access vendor or admin functionality.
- Vendor can access owned vendor functionality.
- Vendor cannot modify another vendor.
- Vendor cannot access admin functionality.
- Admin can access admin functionality.
- Admin vendor override works only if retained by policy.

---

## 17. Definition of Done

KAN-124 is complete when:

- Customers can register and log in through the website.
- Vendors can log in through the website.
- New vendors complete phone verification before account creation.
- Mock codes appear only in the local API terminal.
- OTP generation, hashing, expiry, attempts and consumption operate correctly.
- Successful authentication creates a server-side session.
- Session tokens are never stored in plaintext.
- Valid sessions survive refresh.
- Logout invalidates the session.
- Suspended and deleted users cannot log in.
- Customer routes use the authenticated identity.
- Vendor routes enforce role and ownership.
- Admin routes require the admin role.
- Seeded identities are removed from protected operations.
- English and Bangla authentication flows work.
- Session, role and ownership tests pass.
- No authentication secrets or genuine identity information are committed.

---

## 18. Files Changed So Far

```text
backend/lib/middleware/auth.js
backend/routes/auth.js
backend/index.js
login-audit.md
```

Current implementation status:

- Global session resolution exists.
- Authentication, role and ownership middleware exists.
- Mock verification requests work.
- OTP confirmation and session issuance are not implemented.
- Public login and customer-registration pages are not implemented.
- Private routes are not fully protected.
- No authentication secrets or genuine identity information have been committed.

This section must be updated as files are added.

---

## 19. Current Conclusion

The RBAC foundation and mock verification-request flow are operational.

The next priority is to create the public registration and login interface, followed by OTP confirmation and server-side session creation.

The implementation must preserve this security model:

```text
Frontend provides the experience
Backend proves identity
Session establishes the caller
Role controls the permitted area
Ownership controls the permitted vendor
```

The backend remains the authoritative security boundary.
